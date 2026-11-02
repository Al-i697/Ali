import os
from io import StringIO
from unittest import mock

from django.contrib.auth import get_user_model
from django.core.management import CommandError, call_command
from django.test import TestCase

from core.permissions import get_role

User = get_user_model()
ENV = {"GASDIST_OWNER_USERNAME": "Boss", "GASDIST_OWNER_PASSWORD": "a-long-secret-1", "GASDIST_OWNER_NAME": "أبو سالم"}


def run():
    out = StringIO()
    call_command("ensure_owner", stdout=out)
    return out.getvalue()


class EnsureOwnerTests(TestCase):
    def test_creates_the_owner_once_from_the_environment(self):
        with mock.patch.dict(os.environ, ENV):
            run()
            run()  # restart: nothing changes
        (owner,) = User.objects.all()
        self.assertEqual((owner.username, owner.first_name, get_role(owner)), ("boss", "أبو سالم", "owner"))
        self.assertTrue(owner.check_password("a-long-secret-1"))

    def test_does_nothing_when_users_exist(self):
        User.objects.create_user("someone", password="x12345")
        with mock.patch.dict(os.environ, ENV):
            run()
        self.assertEqual(User.objects.count(), 1)

    def test_without_settings_it_warns_and_creates_nothing(self):
        with mock.patch.dict(os.environ, {}, clear=False):
            for k in ENV:
                os.environ.pop(k, None)
            self.assertIn("ما في أي مستخدم", run())
        self.assertEqual(User.objects.count(), 0)

    def test_a_short_password_is_refused_for_the_owner(self):
        with mock.patch.dict(os.environ, {**ENV, "GASDIST_OWNER_PASSWORD": "short123"}):
            with self.assertRaises(CommandError):
                run()
        self.assertEqual(User.objects.count(), 0)
