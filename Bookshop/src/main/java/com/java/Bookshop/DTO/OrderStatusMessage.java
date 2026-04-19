package com.java.Bookshop.DTO;

import com.java.Bookshop.Entity.Status;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderStatusMessage {
    private Long orderId;
    private Status targetStatus;
}