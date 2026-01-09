from django.core.management.base import BaseCommand
from lab.models import LabTest


class Command(BaseCommand):
    help = 'Seed the database with common lab tests'

    def handle(self, *args, **kwargs):
        lab_tests = [
            # Hematology
            {
                'name': 'Full Blood Count',
                'code': 'FBC',
                'category': 'Hematology',
                'description': 'Complete blood count with differential',
                'sample_type': 'Blood',
                'turnaround_time': '2-4 hours',
                'normal_range': 'WBC: 4-11 x10^9/L, RBC: 4.5-5.5 x10^12/L, Hb: 12-16 g/dL, Platelets: 150-400 x10^9/L',
            },
            {
                'name': 'Blood Grouping',
                'code': 'BG',
                'category': 'Hematology',
                'description': 'ABO and Rh blood grouping',
                'sample_type': 'Blood',
                'turnaround_time': '1-2 hours',
                'normal_range': 'A, B, AB, or O; Rh+ or Rh-',
            },
            {
                'name': 'Sickling Test',
                'code': 'SICK',
                'category': 'Hematology',
                'description': 'Screening for sickle cell trait',
                'sample_type': 'Blood',
                'turnaround_time': '1-2 hours',
                'normal_range': 'Negative',
            },
            {
                'name': 'HB Electrophoresis',
                'code': 'HBEL',
                'category': 'Hematology',
                'description': 'Hemoglobin electrophoresis for hemoglobinopathies',
                'sample_type': 'Blood',
                'turnaround_time': '24 hours',
                'normal_range': 'HbA: >95%, HbA2: <3.5%, HbF: <2%',
            },
            {
                'name': 'G6PD',
                'code': 'G6PD',
                'category': 'Hematology',
                'description': 'Glucose-6-phosphate dehydrogenase deficiency test',
                'sample_type': 'Blood',
                'turnaround_time': '24 hours',
                'normal_range': 'Normal enzyme activity',
            },
            
            # Biochemistry
            {
                'name': 'Lipid Panel',
                'code': 'LIPID',
                'category': 'Biochemistry',
                'description': 'Total cholesterol, HDL, LDL, triglycerides',
                'sample_type': 'Serum',
                'turnaround_time': '4-6 hours',
                'normal_range': 'Total Chol: <200 mg/dL, HDL: >40 mg/dL, LDL: <100 mg/dL, TG: <150 mg/dL',
            },
            {
                'name': 'Liver Function Test (LFT)',
                'code': 'LFT',
                'category': 'Biochemistry',
                'description': 'ALT, AST, ALP, bilirubin, albumin',
                'sample_type': 'Serum',
                'turnaround_time': '4-6 hours',
                'normal_range': 'ALT: <40 U/L, AST: <40 U/L, ALP: 44-147 U/L',
            },
            {
                'name': 'Kidney Function Test (KFT)',
                'code': 'KFT',
                'category': 'Biochemistry',
                'description': 'Creatinine, urea, electrolytes',
                'sample_type': 'Serum',
                'turnaround_time': '4-6 hours',
                'normal_range': 'Creatinine: 0.6-1.2 mg/dL, Urea: 7-20 mg/dL',
            },
            {
                'name': 'Fasting Blood Sugar',
                'code': 'FBS',
                'category': 'Biochemistry',
                'description': 'Fasting glucose level',
                'sample_type': 'Blood',
                'turnaround_time': '1-2 hours',
                'normal_range': '70-100 mg/dL',
            },
            {
                'name': 'Random Blood Sugar',
                'code': 'RBS',
                'category': 'Biochemistry',
                'description': 'Random glucose level',
                'sample_type': 'Blood',
                'turnaround_time': '1 hour',
                'normal_range': '<140 mg/dL',
            },
            
            # Parasitology
            {
                'name': 'Malaria Test (Blood Film)',
                'code': 'MALBF',
                'category': 'Parasitology',
                'description': 'Microscopic examination for malaria parasites',
                'sample_type': 'Blood',
                'turnaround_time': '1-2 hours',
                'normal_range': 'Negative',
            },
            {
                'name': 'Malaria RDT',
                'code': 'MALRDT',
                'category': 'Parasitology',
                'description': 'Rapid diagnostic test for malaria',
                'sample_type': 'Blood',
                'turnaround_time': '30 minutes',
                'normal_range': 'Negative',
            },
            
            # Microbiology
            {
                'name': 'Urine Routine Exam',
                'code': 'URE',
                'category': 'Microbiology',
                'description': 'Urinalysis with microscopy',
                'sample_type': 'Urine',
                'turnaround_time': '2-4 hours',
                'normal_range': 'pH: 4.5-8, Protein: Negative, Glucose: Negative',
            },
            {
                'name': 'Stool Routine Exam',
                'code': 'SRE',
                'category': 'Microbiology',
                'description': 'Stool microscopy and examination',
                'sample_type': 'Stool',
                'turnaround_time': '2-4 hours',
                'normal_range': 'No parasites, No blood',
            },
            
            # Serology
            {
                'name': 'Typhoid (IgM/IgG)',
                'code': 'TYPH',
                'category': 'Serology',
                'description': 'Typhoid antibody test',
                'sample_type': 'Serum',
                'turnaround_time': '2-4 hours',
                'normal_range': 'Negative',
            },
            {
                'name': 'H. Pylori',
                'code': 'HPYL',
                'category': 'Serology',
                'description': 'Helicobacter pylori antibody test',
                'sample_type': 'Serum',
                'turnaround_time': '2-4 hours',
                'normal_range': 'Negative',
            },
            {
                'name': 'Hepatitis B',
                'code': 'HBV',
                'category': 'Serology',
                'description': 'Hepatitis B surface antigen',
                'sample_type': 'Serum',
                'turnaround_time': '4-6 hours',
                'normal_range': 'Negative',
            },
            {
                'name': 'Hepatitis B Profile',
                'code': 'HBVP',
                'category': 'Serology',
                'description': 'Complete hepatitis B panel',
                'sample_type': 'Serum',
                'turnaround_time': '4-6 hours',
                'normal_range': 'All negative except anti-HBs if vaccinated',
            },
            {
                'name': 'VDRL (Syphilis)',
                'code': 'VDRL',
                'category': 'Serology',
                'description': 'Syphilis screening test',
                'sample_type': 'Serum',
                'turnaround_time': '2-4 hours',
                'normal_range': 'Non-reactive',
            },
            {
                'name': 'Chlamydia',
                'code': 'CHLAM',
                'category': 'Serology',
                'description': 'Chlamydia antibody test',
                'sample_type': 'Swab',
                'turnaround_time': '24 hours',
                'normal_range': 'Negative',
            },
            
            # Immunology
            {
                'name': 'HIV / Retro Screening',
                'code': 'HIV',
                'category': 'Immunology',
                'description': 'HIV antibody screening',
                'sample_type': 'Blood',
                'turnaround_time': '2-4 hours',
                'normal_range': 'Non-reactive',
            },
            {
                'name': 'Pregnancy Test',
                'code': 'PREG',
                'category': 'Immunology',
                'description': 'Beta-hCG pregnancy test',
                'sample_type': 'Urine',
                'turnaround_time': '30 minutes',
                'normal_range': 'Negative (for non-pregnant)',
            },
            {
                'name': 'Gonorrhea',
                'code': 'GONO',
                'category': 'Immunology',
                'description': 'Gonorrhea screening test',
                'sample_type': 'Swab',
                'turnaround_time': '24 hours',
                'normal_range': 'Negative',
            },
        ]

        created_count = 0
        updated_count = 0

        for test_data in lab_tests:
            test, created = LabTest.objects.update_or_create(
                code=test_data['code'],
                defaults=test_data
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'Created: {test.name}'))
            else:
                updated_count += 1
                self.stdout.write(self.style.WARNING(f'Updated: {test.name}'))

        self.stdout.write(self.style.SUCCESS(f'\nTotal: {created_count} created, {updated_count} updated'))
