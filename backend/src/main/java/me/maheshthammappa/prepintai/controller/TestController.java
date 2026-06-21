package me.maheshthammappa.prepintai.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import me.maheshthammappa.prepintai.repository.TestRepository;

@CrossOrigin(origins = "*")
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

    @GetMapping("/connection-test")
    public String checkFrontendBackendConnection() {
        return "Frontend and Backend Connected Successfully";
    }

    @GetMapping("/db-test")
    public String checkDatabaseConnection() {
        try {
            testRepository.count();
            return "Database Connected Successfully";
        } catch (Exception e) {
            return "Database Connection Failed";
        }
    }
}