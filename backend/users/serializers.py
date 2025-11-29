# users/serializers.py
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # still include claims in the token itself
        token['username'] = user.username
        token['is_staff'] = user.is_staff
        token['is_superuser'] = user.is_superuser
        return token

    def validate(self, attrs):
        """
        Returns the token pair and extra user fields in the response body.
        """
        data = super().validate(attrs)

        # `data` now contains 'refresh' and 'access'
        # Add any extra user info you want returned in the login response:
        user = self.user
        data.update({
            "username": user.username,
            "email": user.email,
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
        })

        return data
