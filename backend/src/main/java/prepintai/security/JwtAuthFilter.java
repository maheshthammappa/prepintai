// ─────────────────────────────────────────────────────────────────────────────
// security/JwtAuthFilter.java
//
// PURPOSE:
//   A security filter that intercepts EVERY incoming HTTP request to check if
//   the user sent a valid "Bearer" JWT token in the Authorization header.
//
// DATA FLOW:
//   1. Request Interception: `doFilterInternal` runs before any Controller.
//   2. Header Extraction: It looks for `Authorization: Bearer <token>`.
//   3. Token Validation: Uses `JwtUtils` to decrypt and verify the token.
//   4. User Loading: Extracts the username, loads their details from the database
//      using `CustomUserDetailsService`.
//   5. Context Setting: If valid, it tells Spring Security "This user is authenticated",
//      and the request is allowed to proceed to the Controller.
// ─────────────────────────────────────────────────────────────────────────────
package prepintai.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        // Retrieve and parse Authorization bearer header
        String authHeader = request.getHeader("Authorization");
        String jwtToken = null;
        String username = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwtToken = authHeader.substring(7);
            try {
                username = jwtUtils.getUsernameFromToken(jwtToken);
            } catch (Exception e) {
                // Token is malformed or invalid, ignore and let filter chain handle it
            }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            if (jwtUtils.validateToken(jwtToken)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }
}
