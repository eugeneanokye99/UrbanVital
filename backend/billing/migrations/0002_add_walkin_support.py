# Generated migration for walk-in customer support

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('billing', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='invoice',
            name='patient',
            field=models.ForeignKey(blank=True, null=True, on_delete=models.CASCADE, related_name='invoices', to='patients.patient'),
        ),
        migrations.AddField(
            model_name='invoice',
            name='walkin_id',
            field=models.CharField(blank=True, help_text='Walk-in customer ID', max_length=50, null=True),
        ),
    ]