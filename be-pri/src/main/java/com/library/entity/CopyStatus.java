package com.library.entity;

public enum CopyStatus {
    AVAILABLE,  // Sẵn sàng cho mượn (chiếm 1 chỗ)
    RESERVED,   // Đã giữ chỗ chờ lấy (chiếm 1 chỗ)
    BORROWED,   // Đang mượn (KHÔNG chiếm chỗ)
    DAMAGED,    // Bị hỏng (chiếm 1 chỗ)
    LOST        // Bị mất (KHÔNG chiếm chỗ)
}
