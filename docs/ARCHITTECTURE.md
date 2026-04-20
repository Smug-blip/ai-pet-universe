

\## Backend Architecture



\### Authentication Flow

1\. User registers with email/password

2\. Password is hashed using bcrypt

3\. JWT token is generated on login

4\. Token is used for subsequent API requests



\### Database

\- PostgreSQL for user and companion data

\- Connection pooling via `pg` library



\### API Endpoints

\- `GET /api/health` - Server status

\- `POST /api/auth/register` - User registration

\- `POST /api/auth/login` - User login

\- `GET /api/companions` - List user's companions

\- `POST /api/companions` - Create new companion



\## Security Considerations

\- JWT tokens expire after 7 days

\- Passwords hashed with bcrypt (10 salt rounds)

\- CORS enabled for frontend communication

\- Environment variables for sensitive data

