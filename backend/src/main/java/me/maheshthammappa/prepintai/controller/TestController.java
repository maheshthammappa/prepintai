package me.maheshthammappa.prepintai.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import me.maheshthammappa.prepintai.repository.TestRepository;

@RestController
public class TestController {

    private final TestRepository testRepository;

    public TestController(TestRepository testRepository) {
        this.testRepository = testRepository;
    }

    @GetMapping("/")
    public String getApiStatus() {
        return "Backend is Running Successfully";
    }

    @GetMapping("/backend-connection")
    public String checkFrontendBackendConnection() {
        return "Frontend and Backend Connected Successfully";
    }

    @GetMapping("/database-connection")
    public String checkDatabaseConnection() {
        try {
            testRepository.count();
            return "Database Connected Successfully";
        } catch (Exception e) {
            return "Database Connection Failed";
        }
    }
}