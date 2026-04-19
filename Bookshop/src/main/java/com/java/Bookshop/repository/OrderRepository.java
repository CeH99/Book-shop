package com.java.Bookshop.repository;

import com.java.Bookshop.Entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserId(Long userId);

    Optional<Order> findByPaymentToken(String paymentToken);
}
