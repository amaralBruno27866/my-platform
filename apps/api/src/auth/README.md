# Auth Contracts (Phase A)

## Routes

- `POST /public/auth/signup`
- `POST /public/auth/login`
- `GET /private/auth/me`

## Status and errors

- Signup: `201`, `400`, `409`
- Login: `200`, `400`, `401`
- Me: `200`, `401`, `403`

Error payload shape:

```json
{
  "message": "string",
  "code": "AUTH_*",
  "details": {}
}
```

## Validation contract

- `cellphone` pattern (when provided): `(XXX) XXX-XXXX`
- `acceptanceTerm` must be `true` on public signup
- `accountStatus` default on signup: `pending (2)`
