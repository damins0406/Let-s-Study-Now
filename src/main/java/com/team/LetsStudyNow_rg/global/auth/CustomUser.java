package com.team.LetsStudyNow_rg.global.auth;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.Collection;

public class CustomUser extends User {
    public String username;
    public String email;
    public Long id;
    public CustomUser(
            String email,
            String password,
            Collection<? extends GrantedAuthority> authorities
    ){
        super(email, password, authorities);
        this.email = email;
    }
}
