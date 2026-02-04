import { Clock, User, Star, ExternalLink } from 'lucide-react';

interface BountyCardProps {
  id: string;
  title: string;
  description: string;
  reward: number;
  creator: string;
  deadline: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  minReputation: number;
  tags: string[];
}

export default function BountyCard({
  id,
  title,
  description,
  reward,
  creator,
  deadline,
  difficulty,
  minReputation,
  tags
}: BountyCardProps) {
  const difficultyColor = {
    'Easy': 'bg-green-500',
    'Medium': 'bg-yellow-500', 
    'Hard': 'bg-red-500'
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-purple-500 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
          <p className="text-gray-400 text-sm mb-3 line-clamp-2">{description}</p>
        </div>
        <div className="flex flex-col items-end ml-4">
          <div className="text-2xl font-bold text-green-400 mb-1">
            {reward} SOL
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium text-white ${difficultyColor[difficulty]}`}>
            {difficulty}
          </div>
        </div>
      </div>

      <div className="flex items-center text-sm text-gray-400 mb-4">
        <User className="h-4 w-4 mr-1" />
        <span className="mr-4">@{creator}</span>
        <Clock className="h-4 w-4 mr-1" />
        <span className="mr-4">{deadline}</span>
        <Star className="h-4 w-4 mr-1" />
        <span>Min Rep: {minReputation}</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag, index) => (
          <span 
            key={index}
            className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex space-x-3">
        <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors font-medium">
          Claim Task
        </button>
        <button className="flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-gray-300 py-2 px-4 rounded-lg transition-colors">
          <ExternalLink className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}