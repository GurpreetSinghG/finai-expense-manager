package com.finai.expense_manager.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "investment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Investment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String investmentName;

    @Column(nullable = false, length = 50)
    private String investmentType;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal investedAmount;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal currentValue;

    private LocalDate purchaseDate;

    @Column(length = 500)
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
