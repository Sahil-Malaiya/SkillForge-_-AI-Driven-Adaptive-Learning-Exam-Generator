package com.springpro.repository;

import com.springpro.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentRepository extends JpaRepository<Student, Long> {
    java.util.Optional<Student> findByEmail(String email);
}
