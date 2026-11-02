from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    # Django's built-in admin is the owner's emergency tool for fixing data.
    path("admin/", admin.site.urls),
    path("", include("core.urls")),
]
