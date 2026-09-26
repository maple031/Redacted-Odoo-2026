package com.stocksense.auth;

import com.stocksense.auth.dto.*;
import com.stocksense.users.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * Core authentication business logic.
 *
 * <p>Handles signup, login (via Spring Security {@link AuthenticationManager}),
 * current-user resolution, forgot-password challenge generation, and
 * reset-password challenge consumption.
 *
 * <p>NEVER logs plaintext passwords or reset codes at INFO level or above.
 * Reset codes are logged ONLY at DEBUG level for development convenience.
 */
@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    /** Reset challenge lifetime in minutes. */
    private static final int RESET_CODE_TTL_MINUTES = 15;

    /** Maximum failed verification attempts before a challenge is locked out. */
    private static final int MAX_RESET_ATTEMPTS = 5;

    /** Length of the generated reset code. */
    private static final int RESET_CODE_LENGTH = 8;

    private static final String UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    private static final String LOWER = "abcdefghjkmnpqrstuvwxyz";
    private static final String DIGITS = "23456789";
    private static final String RESET_CODE_CHARS = UPPER + LOWER + DIGITS;

    private final AppUserRepository userRepo;
    private final PasswordResetChallengeRepository challengeRepo;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(AppUserRepository userRepo,
                       PasswordResetChallengeRepository challengeRepo,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager) {
        this.userRepo             = userRepo;
        this.challengeRepo        = challengeRepo;
        this.passwordEncoder      = passwordEncoder;
        this.authenticationManager = authenticationManager;
    }

    // ── Signup ────────────────────────────────────────────────────────────────

    /**
     * Register a new user account.
     *
     * @throws IllegalArgumentException if passwords don't match, or loginId/email already taken.
     */
    @Transactional
    public UserSummaryResponse signup(SignupRequest req) {
        if (!req.password().equals(req.confirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }
        if (userRepo.existsByLoginIdIgnoreCase(req.loginId())) {
            throw new IllegalArgumentException("Login ID is already taken");
        }
        if (userRepo.existsByEmailIgnoreCase(req.email())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        AppUser user = new AppUser(
                req.loginId().trim(),
                req.email().trim().toLowerCase(),
                passwordEncoder.encode(req.password())
        );

        user = userRepo.save(user);
        log.info("New user signed up: loginId={}", user.getLoginId());
        return UserSummaryResponse.from(user);
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    /**
     * Authenticate with login ID (or email) and password.
     *
     * <p>On success, creates a new session (session fixation protection is handled
     * by Spring Security's {@code SessionFixationProtectionStrategy}).
     *
     * @throws BadCredentialsException  if credentials are invalid.
     * @throws DisabledException        if the account is disabled ({@code active = false}).
     */
    @Transactional
    public UserSummaryResponse login(LoginRequest req, HttpServletRequest httpRequest) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.loginId(), req.password())
        );

        // Session fixation protection: invalidate old session, create new one.
        HttpSession oldSession = httpRequest.getSession(false);
        if (oldSession != null) {
            oldSession.invalidate();
        }
        HttpSession newSession = httpRequest.getSession(true);
        SecurityContextHolder.getContext().setAuthentication(auth);
        newSession.setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());

        // Update last_login_at.
        String loginId = auth.getName();
        AppUser user = userRepo.findByLoginIdIgnoreCase(loginId)
                .orElseThrow(() -> new BadCredentialsException("Invalid Login Id or Password"));
        userRepo.updateLastLoginAt(user.getId(), OffsetDateTime.now());

        log.info("User logged in: loginId={}", loginId);
        return UserSummaryResponse.from(user);
    }

    // ── Current user ──────────────────────────────────────────────────────────

    /**
     * Resolve the currently authenticated user from the security context.
     */
    @Transactional(readOnly = true)
    public UserSummaryResponse currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        String loginId = auth.getName();
        AppUser user = userRepo.findByLoginIdIgnoreCase(loginId).orElse(null);
        return user != null ? UserSummaryResponse.from(user) : null;
    }

    // ── Forgot password ───────────────────────────────────────────────────────

    /**
     * Generate a password-reset challenge.
     *
     * <p>Always returns a generic success message to prevent account enumeration.
     * If the user doesn't exist, we silently do nothing.
     *
     * <p>The raw reset code is logged at DEBUG level ONLY for development.
     * In production, this log level should be disabled and an email service
     * should deliver the code.
     */
    @Transactional
    public void forgotPassword(ForgotPasswordRequest req) {
        AppUser user = userRepo.findByLoginIdOrEmailIgnoreCase(req.emailOrLoginId())
                .orElse(null);

        if (user == null || !user.isActive()) {
            // Silent — do not reveal whether the account exists.
            log.debug("Forgot-password request for unknown/inactive identifier: [redacted]");
            return;
        }

        // Consume any existing active challenges for this user.
        List<PasswordResetChallenge> existing = challengeRepo.findUnconsumedByUserId(user.getId());
        for (PasswordResetChallenge c : existing) {
            c.consume();
        }
        challengeRepo.saveAll(existing);

        // Generate a cryptographically secure reset code.
        String rawCode = generateResetCode();
        String codeHash = passwordEncoder.encode(rawCode);
        OffsetDateTime expiresAt = OffsetDateTime.now().plusMinutes(RESET_CODE_TTL_MINUTES);

        PasswordResetChallenge challenge = new PasswordResetChallenge(user, codeHash, expiresAt);
        challengeRepo.save(challenge);

        // DEV ONLY: log the raw code so it can be used manually.
        // In production, send via email instead and remove this log.
        log.debug("=== DEV RESET CODE for loginId={}: {} (expires {}) ===",
                user.getLoginId(), rawCode, expiresAt);
        log.info("Password reset challenge created for loginId={}", user.getLoginId());
    }

    // ── Reset password ────────────────────────────────────────────────────────

    /**
     * Verify a reset code and update the user's password.
     *
     * @throws IllegalArgumentException if passwords don't match or the code is invalid/expired.
     */
    @Transactional
    public void resetPassword(ResetPasswordRequest req) {
        if (!req.newPassword().equals(req.confirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        AppUser user = userRepo.findByLoginIdOrEmailIgnoreCase(req.emailOrLoginId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid reset request"));

        List<PasswordResetChallenge> activeChallenges =
                challengeRepo.findActiveChallengesByUserId(user.getId());

        if (activeChallenges.isEmpty()) {
            throw new IllegalArgumentException("No valid reset code found. Please request a new one.");
        }

        // Try to match the code against active challenges.
        PasswordResetChallenge matched = null;
        for (PasswordResetChallenge challenge : activeChallenges) {
            if (challenge.getAttemptCount() >= MAX_RESET_ATTEMPTS) {
                continue; // Skip locked-out challenges.
            }
            if (passwordEncoder.matches(req.resetCode(), challenge.getCodeHash())) {
                matched = challenge;
                break;
            } else {
                challenge.incrementAttempt();
                challengeRepo.save(challenge);
            }
        }

        if (matched == null) {
            throw new IllegalArgumentException("Invalid or expired reset code");
        }

        // Consume ALL unconsumed challenges for this user (single-use guarantee).
        List<PasswordResetChallenge> allUnconsumed =
                challengeRepo.findUnconsumedByUserId(user.getId());
        for (PasswordResetChallenge c : allUnconsumed) {
            c.consume();
        }
        challengeRepo.saveAll(allUnconsumed);

        // Update password.
        user.setPasswordHash(passwordEncoder.encode(req.newPassword()));
        userRepo.save(user);

        log.info("Password successfully reset for loginId={}", user.getLoginId());
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String generateResetCode() {
        StringBuilder sb = new StringBuilder(RESET_CODE_LENGTH);
        for (int i = 0; i < RESET_CODE_LENGTH; i++) {
            sb.append(RESET_CODE_CHARS.charAt(secureRandom.nextInt(RESET_CODE_CHARS.length())));
        }
        return sb.toString();
    }
}
