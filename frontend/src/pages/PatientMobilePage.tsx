import { PatientMobileInterface } from '@/components/dashboard/PatientMobileInterface'
import { BiometricsProvider } from '@/contexts/BiometricsContext'
import { BiometricGuard } from '@/components/auth/BiometricGuard'

export default function PatientMobilePage() {
    return (
        <BiometricsProvider>
            <BiometricGuard>
                <PatientMobileInterface />
            </BiometricGuard>
        </BiometricsProvider>
    )
}
