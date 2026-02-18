from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken

from users.serializers import LoginSerializer, UserSerializer


def _set_auth_cookies(response, access_token: str, refresh_token: str):

    response.set_cookie(
        key=settings.JWT_AUTH_COOKIE,
        value=str(access_token), # same as url.QueryEscape
        max_age=int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds()),
        path=settings.JWT_AUTH_COOKIE_PATH,
        domain=settings.JWT_AUTH_COOKIE_DOMAIN,
        secure=settings.JWT_AUTH_COOKIE_SECURE,
        httponly=settings.JWT_AUTH_COOKIE_HTTP_ONLY,
        samesite=settings.JWT_AUTH_COOKIE_SAMESITE,
    )

    response.set_cookie(
        key=settings.JWT_AUTH_REFRESH_COOKIE,
        value=str(refresh_token),
        max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()),
        path=settings.JWT_AUTH_COOKIE_PATH,
        domain=settings.JWT_AUTH_COOKIE_DOMAIN,
        secure=settings.JWT_AUTH_COOKIE_SECURE,
        httponly=settings.JWT_AUTH_COOKIE_HTTP_ONLY,
        samesite=settings.JWT_AUTH_COOKIE_SAMESITE,
    )

# def _set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
#     """Attach access + refresh tokens as HttpOnly cookies to a response."""
#     cookie_kwargs = dict(
#         httponly=settings.JWT_AUTH_COOKIE_HTTP_ONLY,
#         secure=settings.JWT_AUTH_COOKIE_SECURE,
#         samesite=settings.JWT_AUTH_COOKIE_SAMESITE,

#     )
#     response.set_cookie(
#         settings.JWT_AUTH_COOKIE,
#         str(access_token),
#         max_age=int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds()),
#         **cookie_kwargs,
#     )
#     response.set_cookie(
#         settings.JWT_AUTH_REFRESH_COOKIE,
#         str(refresh_token),
#         max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()),
#         **cookie_kwargs,
#     )


def _build_auth_response(user) -> dict:
    """Generate tokens for a user and return the full payload."""
    refresh = RefreshToken.for_user(user)
    return {
        "user":          UserSerializer(user).data,
        "access_token":  str(refresh.access_token),
        "refresh_token": str(refresh),
    }


# ─── Login ────────────────────────────────────────────────────────────────────

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user    = serializer.validated_data["user"]
        payload = _build_auth_response(user)

        response = Response(payload, status=status.HTTP_200_OK)
        _set_auth_cookies(response, payload["access_token"], payload["refresh_token"])
        return response


# ─── Token Refresh ────────────────────────────────────────────────────────────

class RefreshView(APIView):
    """
    Reads the refresh token from the HttpOnly cookie, rotates it,
    and returns the same payload shape as login (user data + new tokens).
    """
    permission_classes = [AllowAny]

    def post(self, request):
        raw_refresh = request.COOKIES.get(settings.JWT_AUTH_REFRESH_COOKIE)

        if not raw_refresh:
            return Response(
                {"detail": "Refresh token not found."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            refresh  = RefreshToken(raw_refresh)
            user     = refresh.user  # added by simplejwt when ROTATE_REFRESH_TOKENS=True
            # Force rotation — blacklists old token and issues a new one
            new_refresh = RefreshToken.for_user(user)
            refresh.blacklist()
        except (TokenError, InvalidToken) as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_401_UNAUTHORIZED)

        payload = {
            "user":          UserSerializer(user).data,
            "access_token":  str(new_refresh.access_token),
            "refresh_token": str(new_refresh),
        }

        response = Response(payload, status=status.HTTP_200_OK)
        _set_auth_cookies(response, payload["access_token"], payload["refresh_token"])
        return response


# ─── Logout ───────────────────────────────────────────────────────────────────

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        raw_refresh = request.COOKIES.get(settings.JWT_AUTH_REFRESH_COOKIE)

        if raw_refresh:
            try:
                RefreshToken(raw_refresh).blacklist()
            except (TokenError, InvalidToken):
                pass  # Already invalid — proceed with cookie deletion

        response = Response({"detail": "Logged out successfully."}, status=status.HTTP_200_OK)
        response.delete_cookie(settings.JWT_AUTH_COOKIE)
        response.delete_cookie(settings.JWT_AUTH_REFRESH_COOKIE)
        return response


# ─── Me ───────────────────────────────────────────────────────────────────────

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)