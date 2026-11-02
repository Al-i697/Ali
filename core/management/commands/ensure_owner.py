"""Create the company owner's account on a fresh server, from environment variables.

Run on every start-up; it does nothing once any user exists. This is how the
first account gets made on a hosted server where nobody has a terminal.

    GASDIST_OWNER_USERNAME   the login name
    GASDIST_OWNER_PASSWORD   at least 10 characters (this account sees everything)
    GASDIST_OWNER_NAME       display name (optional)
"""
import os

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.management.base import BaseCommand, CommandError

MIN_LENGTH = 10


class Command(BaseCommand):
    help = "ينشئ حساب مدير الشركة من متغيرات البيئة إذا ما في أي مستخدم."

    def handle(self, *args, **options):
        User = get_user_model()
        if User.objects.exists():
            self.stdout.write("يوجد مستخدمون: ما تغيّر شي.")
            return
        username = os.environ.get("GASDIST_OWNER_USERNAME", "").strip().lower()
        password = os.environ.get("GASDIST_OWNER_PASSWORD", "")
        if not username or not password:
            self.stdout.write(self.style.WARNING(
                "ما في أي مستخدم ولا انحدد GASDIST_OWNER_USERNAME / GASDIST_OWNER_PASSWORD. "
                "ما راح تقدر تدخل قبل ما تحددهم وتعيد التشغيل."
            ))
            return
        if len(password) < MIN_LENGTH:
            raise CommandError(f"كلمة سر مدير الشركة لازم تكون {MIN_LENGTH} خانات على الأقل.")
        try:
            validate_password(password)
        except ValidationError as exc:
            raise CommandError(" ".join(exc.messages))
        User.objects.create_superuser(
            username, password=password, first_name=os.environ.get("GASDIST_OWNER_NAME", "مدير الشركة")
        )
        self.stdout.write(self.style.SUCCESS(f"تم إنشاء حساب مدير الشركة: {username}"))
