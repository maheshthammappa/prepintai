# PrepIntAI 🚀

PrepIntAI is an AI-powered interview preparation platform that helps users practice technical interviews by generating interview questions and evaluating answers using AI.

## 🌐 Live Demo

https://maheshthammappa.github.io/prepintai

## ✨ Features

- Generate interview questions based on topic
- Select experience level (Beginner, Intermediate, Advanced)
- AI-powered answer evaluation
- Question-wise scoring and feedback
- Suggested interview-ready answers
- Overall performance analysis
- Responsive user interface
- Real-time backend integration

## 🛠️ Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- Axios

### Backend
- Java
- Spring Boot
- Spring Web
- Spring Data JPA

### Database
- PostgreSQL

### AI Integration
- Google Gemini API

## 📂 Project Structure

```
prepintai/
├── frontend/
├── backend/
├── .github/
└── README.md
```

## 🚀 Getting Started

### Clone Repository

```bash
git clone https://github.com/maheshthammappa/prepintai.git
cd prepintai
```

### Backend Setup

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## 🔑 Environment Variables

### Backend

Create `application-prod.properties` or configure environment variables:

```properties
SPRING_PROFILES_ACTIVE=prod

DB_URL=your_postgresql_url
DB_USERNAME=your_database_username
DB_PASSWORD=your_database_password

GEMINI_API_KEY=your_gemini_api_key
GEMINI_API_URL=your_gemini_api_url
```

### Frontend

Create `.env`:

```env
VITE_API_URL=http://localhost:8080
```

For production:

```env
VITE_API_URL=https://your-backend-url.com
```

## 🎯 Future Enhancements

- Resume analysis
- Interview history tracking

## 👨‍💻 Author

Mahesh Thammappa

GitHub:
https://github.com/maheshthammappa

## 📄 License

This project is licensed under the MIT License.
