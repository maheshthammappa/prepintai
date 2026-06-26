// ─────────────────────────────────────────────────────────────────────────────
// security/CustomUserDetailsService.java
//
// PURPOSE:
//   A Spring Security service that loads user-specific data from the database
//   during the authentication process.
//
// DATA FLOW:
//   1. Spring Security needs to verify a user's credentials (or token).
//   2. It calls `loadUserByUsername(username)`.
//   3. This service queries the `UserRepository` to find the user in the database.
//   4. It returns a Spring `UserDetails` object which Spring Security uses to
//      grant or deny access.
// ─────────────────────────────────────────────────────────────────────────────
package prepintai.security;

import prepintai.auth.User;
import prepintai.auth.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                new ArrayList<>()
        );
    }
}
