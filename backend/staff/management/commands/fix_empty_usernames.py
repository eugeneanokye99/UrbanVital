from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from staff.models import StaffProfile


class Command(BaseCommand):
    help = 'Fix users with empty usernames'

    def handle(self, *args, **options):
        # Find users with empty usernames
        empty_username_users = User.objects.filter(username='')
        
        if not empty_username_users.exists():
            self.stdout.write(self.style.SUCCESS('No users with empty usernames found.'))
            return
        
        self.stdout.write(f'Found {empty_username_users.count()} user(s) with empty username.')
        
        for user in empty_username_users:
            # Check if this user has a staff profile
            try:
                staff = StaffProfile.objects.get(user=user)
                self.stdout.write(f'User ID {user.id} has staff profile: {staff.role}')
            except StaffProfile.DoesNotExist:
                self.stdout.write(f'User ID {user.id} has no staff profile.')
            
            # Ask for confirmation before deletion
            self.stdout.write(f'Delete user ID {user.id}? Email: {user.email or "(empty)"}')
        
        confirm = input('Delete all users with empty usernames? (yes/no): ')
        
        if confirm.lower() == 'yes':
            count = empty_username_users.count()
            empty_username_users.delete()
            self.stdout.write(self.style.SUCCESS(f'Successfully deleted {count} user(s) with empty usernames.'))
        else:
            self.stdout.write(self.style.WARNING('Operation cancelled.'))
