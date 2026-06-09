package com.library.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class ReturnRequest {
    @NotNull
    @Min(0)
    private Integer reportedDamagePercent;

    public Integer getReportedDamagePercent() { return reportedDamagePercent; }
    public void setReportedDamagePercent(Integer reportedDamagePercent) { this.reportedDamagePercent = reportedDamagePercent; }
}
