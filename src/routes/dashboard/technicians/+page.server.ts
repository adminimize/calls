import { id } from '@instantdb/core';
import { db, addTechnician } from '$lib/db';
import { fail } from '@sveltejs/kit';

/** @type {import('./$types').Actions} */
export const actions = {
  addTechnician: async ({ request }) => {
    console.log("\n\n==== FORM SUBMISSION RECEIVED ====");
    console.log("⏰ Time:", new Date().toISOString());
    console.log("📊 Current DB Status:");
    
    try {
      // Check database status
      const dbStatus = {
        hasSchema: !!db.schema,
        hasTechnicians: !!db.schema?.entities?.technicians,
        schemaKeys: Object.keys(db.schema || {}),
        entityKeys: Object.keys(db.schema?.entities || {})
      };
      console.log("📊 DB Status:", dbStatus);
    } catch (statusErr) {
      console.error("❌ Error checking DB status:", statusErr);
    }
    
    const formData = await request.formData();
    
    // Extract form values
    const firstName = formData.get('firstName')?.toString() || '';
    const lastName = formData.get('lastName')?.toString() || '';
    const phone = formData.get('phone')?.toString() || '';
    const email = formData.get('email')?.toString() || '';
    const notes = formData.get('notes')?.toString() || '';
    const rating = Number(formData.get('rating') || 5);
    const companyId = formData.get('companyId')?.toString() || '';
    const existingTechId = formData.get('existingTechId')?.toString() || '';
    
    console.log("📝 Form data extracted:", { 
      firstName, lastName, phone, email, notes, rating, companyId, existingTechId
    });
    
    // Validate form
    if (!firstName || !lastName || !phone) {
      console.log("❌ Validation failed: Required fields missing");
      return fail(400, { 
        error: 'First name, last name, and phone are required',
        values: { firstName, lastName, phone, email, notes, rating }
      });
    }
    
    try {
      // Format phone number
      const formatPhone = (input: string): string => {
        // Strip non-numeric characters
        const cleaned = input.replace(/\D/g, '');
        
        // Format as (XXX) XXX-XXXX or return as is if not enough digits
        if (cleaned.length >= 10) {
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
        }
        return cleaned;
      };
      
      // Prepare data for the technician
      const techData = {
        firstName,
        lastName,
        phone: formatPhone(phone),
        email: email || '',
        verified: false,
        createdAt: new Date().toISOString()
      };
      
      console.log("🔍 Prepared technician data:", techData);
      
      // Try the helper function first
      console.log("🏷️ Trying helper function addTechnician...");
      try {
        const result = await addTechnician(techData);
        console.log("✅ Helper function succeeded:", result);
        
        return {
          success: true,
          message: existingTechId ? 'Technician updated successfully!' : 'New technician added successfully!',
          technicianId: result.id
        };
      } catch (helperErr) {
        console.error("❌ Helper function failed:", helperErr);
        
        // If helper fails, try direct db.transact as a last resort
        console.log("🏷️ Trying direct db.transact as final attempt...");
        try {
          // Create a simple technician with minimal data
          const techId = id();
          console.log("Generated techId:", techId);
          
          // Simple data - only required fields
          const simpleData = {
            firstName: firstName,
            lastName: lastName,
            phone: formatPhone(phone)
          };
          
          // Log what we're about to do
          console.log("Using raw transact with:", {
            techId,
            simpleData
          });
          
          // Try raw transact - keep it very simple
          const directResult = await db.transact(
            db.tx.technicians[techId].update(simpleData)
          );
          
          console.log("✅ Direct transact succeeded:", directResult);
          
          return {
            success: true,
            message: 'New technician added (direct method)!',
            technicianId: techId
          };
        } catch (directErr) {
          console.error("❌ Direct transact failed:", directErr);
          console.error("⚠️ All attempts to add technician failed!");
          
          const errorMessage = directErr instanceof Error ? directErr.message : String(directErr);
          
          return fail(500, { 
            error: 'Failed to save technician after multiple attempts: ' + errorMessage,
            values: { firstName, lastName, phone, email, notes, rating }
          });
        }
      }
    } catch (err) {
      console.error('❌ Error in action handler:', err);
      
      const errorMessage = err instanceof Error ? err.message : String(err);
      
      return fail(500, { 
        error: 'Failed to process: ' + errorMessage,
        values: { firstName, lastName, phone, email, notes, rating }
      });
    }
  }
}; 