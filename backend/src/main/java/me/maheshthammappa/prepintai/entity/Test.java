package me.maheshthammappa.prepintai.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Test {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
}