import {
  IconArrowRightDashed,
  IconClock,
  IconCogwheel,
  IconCrossCircle,
  IconHammers,
  IconLightbulb,
  IconLocation,
  IconPen,
  IconPlaybackPause,
  IconQuestionCircle,
  IconScrollContent,
  IconShield,
  IconThumbsUp,
  IconUser,
} from 'hds-react/icons';

const optionIcon = {
  proposal: <IconQuestionCircle />,
  design: <IconLightbulb />,
  programming: <IconCogwheel />,
  draftInitiation: <IconArrowRightDashed />,
  draftApproval: <IconThumbsUp />,
  constructionPlan: <IconScrollContent />,
  constructionWait: <IconPlaybackPause />,
  construction: <IconHammers />,
  warrantyPeriod: <IconClock />,
  completed: <IconShield />,
  constructionPreparation: <IconPen />,
  suspended: <IconCrossCircle />,
  location: <IconLocation />,
  person: <IconUser />,
};

export default optionIcon;
