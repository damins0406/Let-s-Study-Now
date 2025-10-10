package com.team.LetsStudyNow_rg.auth;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.Collection;

public class CustomUser extends User {
    public String email;
    public Long id;
    public CustomUser(
            String username,
            String password,
            Collection<? extends GrantedAuthority> authorities
    ){
        super(username, password, authorities);
    }
}
