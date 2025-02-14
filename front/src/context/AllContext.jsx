import { UserProvider } from "./UserContext";
// Importe d'autres contextes ici si nécessaire

const AllProviders = ({ children }) => {
    return (
        <UserProvider>
            {children}
        </UserProvider>
    );
};

export default AllProviders;
