/**
 * Audit Service for PharmaGo
 * Handles logging of critical user actions for security and compliance (SEC-02).
 */
import { logger } from "@/utils/logger";

export type AuditAction =
    | 'USER_LOGIN'
    | 'USER_LOGOUT'
    | 'PROFILE_UPDATE'
    | 'ORDER_PLACED'
    | 'PAYMENT_PROCESSED'
    | 'PRESCRIPTION_UPLOADED'
    | 'PHARMACIST_VALIDATION';

interface AuditLog {
    timestamp: string;
    action: AuditAction;
    userId: string;
    details: any;
    ipHash?: string; // Simulated IP hash
}

class AuditService {
    private logs: AuditLog[] = [];

    /**
     * Log a critical action
     */
    log(action: AuditAction, userId: string, details: any) {
        const logEntry: AuditLog = {
            timestamp: new Date().toISOString(),
            action,
            userId,
            details,
            ipHash: this.simulateIpHash()
        };

        this.logs.push(logEntry);

        // In a real app, this would send to a secure backend endpoint (e.g., /api/audit)
        console.groupCollapsed(`[AUDIT] ${action}`);
        logger.log('User:', userId);
        logger.log('Time:', logEntry.timestamp);
        logger.log('Details:', details);
        console.groupEnd();

        // Persist to local storage for demo purposes
        this.saveToStorage();
    }

    private simulateIpHash(): string {
        return 'ip_' + Math.random().toString(36).substr(2, 9);
    }

    private saveToStorage() {
        try {
            // Keep only last 50 logs to avoid overflow
            const recentLogs = this.logs.slice(-50);
            localStorage.setItem('audit_logs', JSON.stringify(recentLogs));
        } catch (e) {
            console.error('Failed to save audit logs', e);
        }
    }

    getLogs() {
        return this.logs;
    }
}

export const auditService = new AuditService();
