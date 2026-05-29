import { supabase } from '../../supabase.js'
import { updatePickupRequest } from '../../api.js'

export const pant = {
    async registerPickup(routeStop, bagsCollected) {
        const { data: { session } } = await supabase.auth.getSession()
        const driverId = session.user.id
        await updatePickupRequest(driverId, routeStop.pickupRequestId, bagsCollected)
    }
}
