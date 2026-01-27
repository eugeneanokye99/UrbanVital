from django.urls import path
from .views import MyTokenObtainPairView, get_current_user, logout_user
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', get_current_user, name='user_profile'),
    path('logout/', logout_user, name='logout_user'),
]
