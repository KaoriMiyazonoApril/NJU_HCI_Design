package com.example.tomatomall.repository;

import com.example.tomatomall.po.Evaluate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EvaluateRepository extends JpaRepository<Evaluate, Integer> {
    Evaluate findByProductIdAndUserId(Integer productId, Integer userId);
}
