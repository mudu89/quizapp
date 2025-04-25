# Quiz App Backend

This is a FastAPI project for a quiz application that connects to a PostgreSQL database.

## Project Structure

```
quiz-app-backend
├── app
│   ├── __init__.py
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   └── database.py
├── requirements.txt
└── README.md
```

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd quiz-app-backend
   ```

2. **Create a virtual environment:**
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. **Install the dependencies:**
   ```
   pip install -r requirements.txt
   ```

4. **Configure the database connection:**
   Update the database connection details in `app/database.py` if necessary.

5. **Run the application:**
   ```
   uvicorn app.main:app --reload
   ```

## Usage

Once the application is running, you can access the API documentation at `http://localhost:8000/docs`.

## License

This project is licensed under the MIT License.