package com.team.LetsStudyNow_rg.checklist;

import com.team.LetsStudyNow_rg.auth.CustomUser;
import com.team.LetsStudyNow_rg.checklist.dto.ChecklistCreateDto;
import com.team.LetsStudyNow_rg.checklist.dto.ChecklistResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "4. 체크리스트 API", description = "체크리스트 CRUD 관련 API")
@RestController
@RequestMapping("/api/checklist")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()") // 인증 필수
public class ChecklistController {
    private final ChecklistService checklistService;

    @Operation(summary = "체크리스트 생성", description = "선택한 날짜에 새로운 할 일을 추가합니다. (인증 필요)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "체크리스트 생성 성공",
                    content = @Content(schema = @Schema(implementation = ChecklistResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "입력값 유효성 검사 실패"),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자 (로그인 필요)")
    })
    @PostMapping
    public ResponseEntity createChecklist(
            @Valid @RequestBody
            ChecklistCreateDto dto,
            BindingResult bindingResult,
            Authentication auth
    ) {
        if (bindingResult.hasErrors()) {
            String errorMessage = bindingResult.getAllErrors().get(0).getDefaultMessage();
            return ResponseEntity.badRequest().body(errorMessage);
        }

        try {
            CustomUser customUser = (CustomUser) auth.getPrincipal();
            ChecklistResponseDto checklistResponseDto = checklistService.createChecklist(customUser, dto);
            return ResponseEntity.ok(checklistResponseDto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
