import { Heart, Trash2, User } from 'lucide-react';

// Icons we use to keep everything looking the same
const defaults = { size: 18, strokeWidth: 2 };

export const HeartIcon = (props) => <Heart {...defaults} {...props} />;
export const TrashIcon = (props) => <Trash2 {...defaults} {...props} />;
export const UserIcon = (props) => <User {...defaults} {...props} />;
