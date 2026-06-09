package com.library.dto;

import java.time.LocalDate;

public class WeeklyChartDTO {
    private LocalDate date;
    private String dayOfWeek;
    private Double workHours;

    public WeeklyChartDTO() {}

    public WeeklyChartDTO(LocalDate date, String dayOfWeek, Double workHours) {
        this.date = date;
        this.dayOfWeek = dayOfWeek;
        this.workHours = workHours;
    }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public String getDayOfWeek() { return dayOfWeek; }
    public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }
    public Double getWorkHours() { return workHours; }
    public void setWorkHours(Double workHours) { this.workHours = workHours; }
}
