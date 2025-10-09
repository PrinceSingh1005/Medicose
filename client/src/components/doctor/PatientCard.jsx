import { Eye, MessageCircle } from "lucide-react";
import PropTypes from "prop-types";

const PatientCard = ({ name, age, email, avatar, lastVisit }) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="p-4 rounded-2xl bg-card border border-border shadow-card hover:shadow-elevated transition-all duration-200 group cursor-pointer">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="h-12 w-12 rounded-full ring-2 ring-accent overflow-hidden flex items-center justify-center bg-gradient-primary text-white font-semibold text-sm transition-all group-hover:ring-primary">
          {avatar ? (
            <img src={avatar} alt={name} className="h-full w-full object-cover" />
          ) : (
            initials
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-card-foreground truncate">{name}</h4>
          <p className="text-sm text-muted-foreground">
            Age: {age} • {email}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Last visit: {lastVisit}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button className="h-8 w-8 flex items-center justify-center rounded-lg border border-border hover:bg-accent hover:text-accent-foreground transition-colors">
            <Eye className="h-4 w-4" />
          </button>
          <button className="h-8 w-8 flex items-center justify-center rounded-lg border border-border hover:bg-accent hover:text-accent-foreground transition-colors">
            <MessageCircle className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

PatientCard.propTypes = {
  name: PropTypes.string.isRequired,
  age: PropTypes.number.isRequired,
  email: PropTypes.string.isRequired,
  avatar: PropTypes.string,
  lastVisit: PropTypes.string.isRequired,
};

export default PatientCard;
