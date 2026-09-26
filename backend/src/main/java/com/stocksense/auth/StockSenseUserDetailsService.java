package com.stocksense.auth;

import com.stocksense.users.AppUser;
import com.stocksense.users.AppUserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Spring Security {@link UserDetailsService} backed by {@code app_user}.
 *
 * <p>Loads users by login ID or email (case-insensitive) so the login form
 * can accept either identifier.
 *
 * <p>Disabled accounts ({@code active = false}) are represented via
 * {@link User#builder()}'s {@code disabled(true)} flag, which Spring Security
 * rejects during authentication with {@code DisabledException}.
 */
@Service
public class StockSenseUserDetailsService implements UserDetailsService {

    private final AppUserRepository users;

    public StockSenseUserDetailsService(AppUserRepository users) {
        this.users = users;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        AppUser user = users.findByLoginIdOrEmailIgnoreCase(identifier)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return User.builder()
                .username(user.getLoginId())        // Spring Security principal = loginId
                .password(user.getPasswordHash())
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole())))
                .disabled(!user.isActive())
                .build();
    }
}
