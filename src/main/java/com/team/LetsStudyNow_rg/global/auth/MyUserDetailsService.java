package com.team.LetsStudyNow_rg.global.auth;


import com.team.LetsStudyNow_rg.domain.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MyUserDetailsService implements UserDetailsService {
    private final MemberRepository memberRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException{
        var user = memberRepository.findByUsername(username).orElseThrow(() -> new IllegalArgumentException("계정이 존재하지 않습니다."));

        // 일반유저: ROLE_USER, 관리자: ROLE_ADMIN
        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority(user.getRole().name()));

        CustomUser customUser = new CustomUser(user.getUsername(), user.getPassword(), authorities);
        customUser.id = user.getId();
        customUser.email = user.getEmail();
        return customUser;
    }
}
