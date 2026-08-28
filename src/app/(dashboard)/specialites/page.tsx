import {
getServicesForSpecialites,
getSpecialites,
} from "@/app/actions/specialite";
import SpecialiteDashboard from "./SpecialiteDashboard";



export default async function SpecialitesPage() {

const [
specialites,
services,
] = await Promise.all([


getSpecialites(),

getServicesForSpecialites(),


]);

return (


<SpecialiteDashboard

  specialites={specialites}

  services={services}

/>


);

}
