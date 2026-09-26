package com.stocksense.auth;

import com.stocksense.auth.dto.*;
import com.stocksense.users.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AppUserRepository userRepo;

    @Mock
    private PasswordResetChallengeRepository challengeRepo;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepo, challengeRepo, passwordEncoder, authenticationManager);
    }

    @Test
    void signup_Success() {
        SignupRequest req = new SignupRequest("john_doe", "john@example.com", "Password123!", "Password123!");

        given(userRepo.existsByLoginIdIgnoreCase("john_doe")).willReturn(false);
        given(userRepo.existsByEmailIgnoreCase("john@example.com")).willReturn(false);
        given(passwordEncoder.encode("Password123!")).willReturn("hashed_pass");

        AppUser savedUser = new AppUser("john_doe", "john@example.com", "hashed_pass");
        savedUser.setId(UUID.randomUUID());
        given(userRepo.save(any(AppUser.class))).willReturn(savedUser);

        UserSummaryResponse result = authService.signup(req);

        assertThat(result.loginId()).isEqualTo("john_doe");
        assertThat(result.email()).isEqualTo("john@example.com");
    }

    @Test
    void signup_PasswordMismatch_Throws() {
        SignupRequest req = new SignupRequest("john_doe", "john@example.com", "Password123!", "Different123!");

        assertThatThrownBy(() -> authService.signup(req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Passwords do not match");
    }

    @Test
    void signup_DuplicateLoginId_Throws() {
        SignupRequest req = new SignupRequest("john_doe", "john@example.com", "Password123!", "Password123!");

        given(userRepo.existsByLoginIdIgnoreCase("john_doe")).willReturn(true);

        assertThatThrownBy(() -> authService.signup(req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Login ID is already taken");
    }

    @Test
    void forgotPassword_CreatesChallengeForExistingUser() {
        ForgotPasswordRequest req = new ForgotPasswordRequest("john_doe");
        AppUser user = new AppUser("john_doe", "john@example.com", "hashed_pass");
        user.setId(UUID.randomUUID());

        given(userRepo.findByLoginIdOrEmailIgnoreCase("john_doe")).willReturn(Optional.of(user));
        given(challengeRepo.findUnconsumedByUserId(any())).willReturn(List.of());
        given(passwordEncoder.encode(any())).willReturn("hashed_code");

        authService.forgotPassword(req);

        verify(challengeRepo).save(any(PasswordResetChallenge.class));
    }

    @Test
    void forgotPassword_UnknownUser_SilentSuccess() {
        ForgotPasswordRequest req = new ForgotPasswordRequest("unknown_user");

        given(userRepo.findByLoginIdOrEmailIgnoreCase("unknown_user")).willReturn(Optional.empty());

        authService.forgotPassword(req);

        // Should not throw, should not save challenge
    }

    @Test
    void resetPassword_Success() {
        ResetPasswordRequest req = new ResetPasswordRequest("CODE1234", "john_doe", "NewPassword1!", "NewPassword1!");
        AppUser user = new AppUser("john_doe", "john@example.com", "old_hash");

        PasswordResetChallenge challenge = new PasswordResetChallenge(user, "code_hash", OffsetDateTime.now().plusMinutes(10));

        given(userRepo.findByLoginIdOrEmailIgnoreCase("john_doe")).willReturn(Optional.of(user));
        given(challengeRepo.findActiveChallengesByUserId(any())).willReturn(List.of(challenge));
        given(passwordEncoder.matches("CODE1234", "code_hash")).willReturn(true);
        given(passwordEncoder.encode("NewPassword1!")).willReturn("new_hash");

        authService.resetPassword(req);

        verify(userRepo).save(user);
        assertThat(user.getPasswordHash()).isEqualTo("new_hash");
    }
}
