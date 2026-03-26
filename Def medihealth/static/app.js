// Supabase project settings
const API_URL = "https://ekdxwbviccuxfyuzrxlu.supabase.co";       // e.g. https://abcxyz.supabase.co
const API_KEY = "sb_publishable_UQOpLPcYf7lRhkymWdwYqA_yQyhDA7b";    // sb_publishable_...

// Table name for this project
const APPOINTMENTS_TABLE = "tbl_customer_appointments";

console.log("JavaScript loaded");
console.log("Using Supabase:", API_URL);

// Run this code when the page has loaded --
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("appointment-form");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();   // stop the page from refreshing
    await addAppointment();   // call our function to save data
  });
});

async function addAppointment() {
  // 1. Read values from the form inputs
  const patient_name = document.getElementById("patient_name").value.trim();
  const patient_dob = document.getElementById("patient_dob").value.trim();
  const patient_telephone = document.getElementById("patient_telephone").value.trim();
  const patient_address = document.getElementById("patient_address").value.trim();
  const patient_medical_history = document.getElementById("patient_medical_history").value.trim();
  const patient_next_of_kin = document.getElementById("patient_next_of_kin").value.trim();
  
    // 2. Basic validation
  if (patient_name === "" || patient_dob === "" || patient_telephone === "" || patient_address === "") {
    alert("Please fill in patient name and appointment date.");
    return;
  }
  
    // 3. Build the object using column names from Supabase
  const body = {
    patient_name: patient_name,      // matches column "patient_name"
    patient_dob : patient_dob,
    patient_telephone : patient_telephone,
    patient_address : patient_address,
    patient_medical_history : patient_medical_history,
    patient_next_of_kin : patient_next_of_kin
  };

  // 4. Send data to Supabase
  try {
    const response = await fetch(`${API_URL}/rest/v1/${APPOINTMENTS_TABLE}`, {
      method: "POST",
      headers: {
        "apikey": API_KEY,
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Supabase error:", err);
      alert("Could not add appointment.");
      return;
    }

    alert("Appointment booked successfully!");
    
    // 5. Clear the form
    document.getElementById("patient_name").value = "";
    document.getElementById("patient_dob").value = "";
    document.getElementById("patient_telephone").value = "";
    document.getElementById("patient_address").value = "";
    document.getElementById("patient_medical_history").value = "";
    document.getElementById("patient_next_of_kin").value = "";

    // 6. (Optional) reload the list of appointments here
    // loadAppointments();

  } 
  catch (error) {
    console.error(error);
    alert("Something went wrong. Check the console.");
  }
}