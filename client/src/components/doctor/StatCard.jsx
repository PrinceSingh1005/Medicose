import PropTypes from "prop-types";

const StatCard = ({ title, value, change, changeType, icon: Icon, gradient }) => {
  const getChangeColor = () => {
    switch (changeType) {
      case "positive":
        return "text-success";
      case "negative":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  const getGradientClass = () => {
    switch (gradient) {
      case "success":
        return "bg-gradient-success";
      case "warning":
        return "bg-gradient-warning";
      default:
        return "bg-gradient-primary";
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl p-6 shadow-card hover:shadow-elevated transition-all duration-200 group cursor-pointer bg-card border border-border">
      <div className="flex items-center justify-between">
        {/* Left section */}
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm font-medium">{title}</p>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-card-foreground">{value}</h3>
            <p className={`text-sm font-medium ${getChangeColor()}`}>{change}</p>
          </div>
        </div>

        {/* Icon */}
        <div
          className={`${getGradientClass()} p-3 rounded-xl shadow-glow group-hover:scale-110 transition-transform duration-200`}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
    </div>
  );
};

// Prop validation
StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  change: PropTypes.string.isRequired,
  changeType: PropTypes.oneOf(["positive", "negative", "neutral"]).isRequired,
  icon: PropTypes.elementType.isRequired,
  gradient: PropTypes.oneOf(["primary", "success", "warning"]).isRequired,
};

export default StatCard;
