import { supabase } from '../supabase.js'
import { postRegisterPickup } from '../api.js'

export const pant = {
    async registerPickup(routeStop, bagsCollected) {
        const { data: { session } } = await supabase.auth.getSession()
        const driverId = session.user.id
        await postRegisterPickup(driverId, routeStop.pickupRequestId, bagsCollected)
    }
}