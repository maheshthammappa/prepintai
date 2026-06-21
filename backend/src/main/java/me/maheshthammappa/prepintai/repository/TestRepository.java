package me.maheshthammappa.prepintai.repository;

import me.maheshthammappa.prepintai.entity.Test;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TestRepository extends JpaRepository<Test, Long> {
}