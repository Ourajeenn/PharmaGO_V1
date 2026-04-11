-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type text NOT NULL CHECK (type IN ('success', 'info', 'warning', 'error')),
    read boolean DEFAULT false NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    metadata jsonb
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
    ON notifications FOR DELETE
    USING (auth.uid() = user_id);

-- Allow service role to insert notifications (for triggers)
CREATE POLICY "Service role can insert notifications"
    ON notifications FOR INSERT
    WITH CHECK (true);

-- Function to notify on new orders
CREATE OR REPLACE FUNCTION notify_new_order()
RETURNS TRIGGER AS $$
BEGIN
    -- Notifier le patient
    INSERT INTO notifications (user_id, title, message, type, metadata)
    VALUES (
        NEW.patient_id,
        'Commande confirmée',
        'Votre commande #' || substring(NEW.id::text, 1, 8) || ' a été créée.',
        'success',
        jsonb_build_object('order_id', NEW.id, 'type', 'order')
    );
    
    -- Notifier la pharmacie (si elle a un user_id)
    IF EXISTS (SELECT 1 FROM pharmacies WHERE id = NEW.pharmacy_id AND user_id IS NOT NULL) THEN
        INSERT INTO notifications (user_id, title, message, type, metadata)
        SELECT
            user_id,
            'Nouvelle commande',
            'Nouvelle commande #' || substring(NEW.id::text, 1, 8) || ' reçue.',
            'info',
            jsonb_build_object('order_id', NEW.id, 'type', 'order')
        FROM pharmacies
        WHERE id = NEW.pharmacy_id AND user_id IS NOT NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new orders
DROP TRIGGER IF EXISTS trigger_notify_new_order ON orders;
CREATE TRIGGER trigger_notify_new_order
    AFTER INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_order();

-- Function to notify on order status changes
CREATE OR REPLACE FUNCTION notify_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status != OLD.status THEN
        INSERT INTO notifications (user_id, title, message, type, metadata)
        VALUES (
            NEW.patient_id,
            'Mise à jour commande',
            'Votre commande est maintenant: ' || NEW.status,
            CASE 
                WHEN NEW.status = 'delivered' THEN 'success'
                WHEN NEW.status = 'cancelled' THEN 'error'
                ELSE 'info'
            END,
            jsonb_build_object('order_id', NEW.id, 'status', NEW.status)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for order status changes
DROP TRIGGER IF EXISTS trigger_notify_order_status_change ON orders;
CREATE TRIGGER trigger_notify_order_status_change
    AFTER UPDATE ON orders
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION notify_order_status_change();
