import MailIcon from "@suid/icons-material/Mail";
import Badge from "@suid/material/Badge";

export default function SimpleBadge() {
  return (
    <Badge badgeContent={4} color="primary">
      <MailIcon color="action" />
    </Badge>
  );
}
