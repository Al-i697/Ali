"""Who can do what.

* مدير الشركة (owner) and مدير (manager): everything.
* سائق (driver): the daily work only — see the route, take and deliver orders,
  add customers, collect payments. No reports, prices, users or corrections.
A Django superuser counts as owner. Anyone without a profile is a driver, so a
forgotten setting can only ever give *less* access.
"""
from functools import wraps

from django.contrib.auth.decorators import login_required
from django.core.exceptions import PermissionDenied

from .models import Role


def get_role(user) -> str:
    if not user.is_authenticated:
        return ""
    if user.is_superuser:
        return Role.OWNER
    profile = getattr(user, "profile", None)
    return profile.role if profile else Role.DRIVER


def is_admin(user) -> bool:
    return get_role(user) in (Role.OWNER, Role.MANAGER)


def admin_required(view):
    @wraps(view)
    @login_required
    def wrapper(request, *args, **kwargs):
        if not is_admin(request.user):
            raise PermissionDenied
        return view(request, *args, **kwargs)

    return wrapper
