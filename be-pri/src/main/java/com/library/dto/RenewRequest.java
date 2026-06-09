package com.library.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class RenewRequest {
    @NotNull
    @Min(3)
    @Max(7)
    private Integer extraDays;

    public Integer getExtraDays() { return extraDays; }
    public void setExtraDays(Integer extraDays) { this.extraDays = extraDays; }
}
