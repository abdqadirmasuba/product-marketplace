from django.conf import settings
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError


class CookieJWTAuthentication(JWTAuthentication):
    """
    Reads the JWT access token from an HttpOnly cookie instead of
    the Authorization header.  Falls back to the header so tools
    like Postman / curl still work during development.
    """

    def authenticate(self, request):
        # 1. Try cookie first
        raw_token = request.COOKIES.get(settings.JWT_AUTH_COOKIE)

        # 2. Fall back to Authorization: Bearer <token> header
        if raw_token is None:
            return super().authenticate(request)

        try:
            validated_token = self.get_validated_token(raw_token)
        except (InvalidToken, TokenError):
            return None

        return self.get_user(validated_token), validated_token