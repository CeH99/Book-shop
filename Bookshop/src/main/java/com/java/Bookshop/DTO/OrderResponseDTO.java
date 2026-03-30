package com.java.Bookshop.DTO;

import com.java.Bookshop.Entity.OrderItem;
import com.java.Bookshop.Entity.Status;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
public class OrderResponseDTO {
    private Long id;

    private BigDecimal totalPrice;

    private LocalDateTime date;

    private Status status;

    private List<OrderItemResponseDTO> listOfItems;

    public OrderResponseDTO(Long id, BigDecimal totalPrice,
                            LocalDateTime orderDate, Status status, List<OrderItem> items) {
        this.id = id;
        this.date = orderDate;
        this.status = status;
        this.totalPrice = totalPrice;

        List<OrderItemResponseDTO> itemResponseDTOList = new ArrayList<>();

        for(OrderItem orderItem : items) {
            itemResponseDTOList.add(new OrderItemResponseDTO(orderItem.getProduct().getTitle(),
                    orderItem.getQuantity(), orderItem.getPrice()));
        }

        listOfItems = itemResponseDTOList;
    }
}
