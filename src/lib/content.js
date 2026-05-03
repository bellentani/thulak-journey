export const gameContent = {
  title: "A Descoberta de Thulak",
  initialLanguage: "pt-BR",
  initialSceneId: "intro_home",
  initialState: {
    flags: [],
    items: []
  },
  chapters: [
    {
      id: "chapter1",
      titleKey: "chapter.1.title",
      summaryKey: "chapter.1.summary",
      startSceneId: "intro_home",
      nextChapterIds: ["chapter2", "chapter3", "chapter4"],
      final: false,
      implemented: true
    },
    {
      id: "chapter2",
      titleKey: "chapter.2.title",
      summaryKey: "chapter.2.summary",
      startSceneId: "chapter2_start",
      nextChapterIds: ["chapter3", "chapter4", "chapter5"],
      final: false,
      implemented: false
    },
    {
      id: "chapter3",
      titleKey: "chapter.3.title",
      summaryKey: "chapter.3.summary",
      startSceneId: "chapter3_start",
      nextChapterIds: ["chapter2", "chapter4", "chapter5"],
      final: false,
      implemented: false
    },
    {
      id: "chapter4",
      titleKey: "chapter.4.title",
      summaryKey: "chapter.4.summary",
      startSceneId: "chapter4_start",
      nextChapterIds: ["chapter2", "chapter3", "chapter5"],
      final: false,
      implemented: false
    },
    {
      id: "chapter5",
      titleKey: "chapter.5.title",
      summaryKey: "chapter.5.summary",
      startSceneId: "chapter5_start",
      nextChapterIds: [],
      final: true,
      implemented: false
    }
  ],
  scenes: [
    {
      id: "intro_home",
      chapterId: "chapter1",
      artId: "grimoire",
      textKey: "scene.intro_home.body",
      choices: [
        {
          textKey: "scene.intro_home.choice_tower",
          goto: "mentor_room",
          transitionAnimationId: "shortWalk",
          effects: [{ type: "setFlag", flag: "visited_tower" }]
        },
        {
          textKey: "scene.intro_home.choice_inn",
          goto: "intro_study",
          transitionAnimationId: "shortWalk"
        }
      ]
    },
    {
      id: "mentor_room",
      chapterId: "chapter1",
      animationId: "candleFlame",
      artId: "altar",
      textKey: "scene.mentor_room.body",
      choices: [
        {
          textKey: "scene.mentor_room.choice_keep_token",
          goto: "intro_study",
          transitionAnimationId: "shortWalk",
          effects: [
            { type: "addItem", item: "mentor_token" },
            { type: "setFlag", flag: "remembered_edrin" }
          ]
        },
        {
          textKey: "scene.mentor_room.choice_leave",
          goto: "intro_study",
          transitionAnimationId: "shortWalk",
          effects: [{ type: "setFlag", flag: "remembered_edrin" }]
        }
      ]
    },
    {
      id: "intro_study",
      chapterId: "chapter1",
      animationId: "grimoirePulse",
      textKey: "scene.intro_study.body",
      choices: [
        {
          textKey: "scene.intro_study.choice_open",
          goto: "whispering_book",
          effects: [{ type: "addItem", item: "black_grimoire" }]
        },
        {
          textKey: "scene.intro_study.choice_origin",
          goto: "traveler_markings",
          effects: [
            { type: "addItem", item: "black_grimoire" },
            { type: "setFlag", flag: "questioned_origin" }
          ]
        },
        {
          textKey: "scene.intro_study.choice_refuse",
          goto: "camp_retreat",
          transitionAnimationId: "campfireRest"
        }
      ]
    },
    {
      id: "traveler_markings",
      chapterId: "chapter1",
      animationId: "candleFlame",
      artId: "skull",
      textKey: "scene.traveler_markings.body",
      choices: [
        {
          textKey: "scene.traveler_markings.choice_journal",
          goto: "whispering_book",
          effects: [{ type: "setFlag", flag: "learned_blue_name" }]
        },
        {
          textKey: "scene.traveler_markings.choice_shrine",
          goto: "shrine_body",
          transitionAnimationId: "shortWalk",
          effects: [{ type: "setFlag", flag: "followed_funeral_trace" }]
        }
      ]
    },
    {
      id: "shrine_body",
      chapterId: "chapter1",
      animationId: "candleFlame",
      artId: "altar",
      textKey: "scene.shrine_body.body",
      choices: [
        {
          textKey: "scene.shrine_body.choice_wound",
          goto: "whispering_book",
          effects: [{ type: "setFlag", flag: "saw_blue_ash" }]
        },
        {
          textKey: "scene.shrine_body.choice_leave",
          goto: "camp_retreat",
          transitionAnimationId: "campfireRest",
          effects: [{ type: "setFlag", flag: "feared_corpse" }]
        }
      ]
    },
    {
      id: "whispering_book",
      chapterId: "chapter1",
      animationId: "skullWhisper",
      artId: "skull",
      textKey: "scene.whispering_book.body",
      choices: [
        {
          textKey: "scene.whispering_book.choice_follow_call",
          goto: "threshold_road",
          transitionAnimationId: "longRide",
          effects: [{ type: "setFlag", flag: "accepted_call" }]
        },
        {
          textKey: "scene.whispering_book.choice_resist",
          goto: "camp_retreat",
          transitionAnimationId: "campfireRest",
          effects: [{ type: "setFlag", flag: "resisted_once" }]
        },
        {
          textKey: "scene.whispering_book.choice_token",
          goto: "threshold_road",
          transitionAnimationId: "longRide",
          conditions: [{ type: "hasItem", item: "mentor_token" }],
          effects: [
            { type: "setFlag", flag: "accepted_call" },
            { type: "setFlag", flag: "carried_edrin_into_dark" }
          ]
        }
      ]
    },
    {
      id: "camp_retreat",
      chapterId: "chapter1",
      animationId: "campfireRest",
      textKey: "scene.camp_retreat.body",
      choices: [
        {
          textKey: "scene.camp_retreat.choice_return",
          goto: "threshold_road",
          transitionAnimationId: "longRide",
          effects: [{ type: "setFlag", flag: "returned_after_retreat" }]
        },
        {
          textKey: "scene.camp_retreat.choice_shrine",
          goto: "shrine_body",
          transitionAnimationId: "shortWalk"
        },
        {
          textKey: "scene.camp_retreat.choice_end",
          goto: "ending_cowardice",
          transitionAnimationId: "longRide"
        }
      ]
    },
    {
      id: "threshold_road",
      chapterId: "chapter1",
      artId: "dungeonGate",
      textKey: "scene.threshold_road.body",
      choices: [
        {
          textKey: "scene.threshold_road.choice_ossuary",
          goto: "war_ossuary",
          transitionAnimationId: "shortWalk"
        },
        {
          textKey: "scene.threshold_road.choice_press_on",
          goto: "chapel_yard",
          transitionAnimationId: "shortWalk"
        },
        {
          textKey: "scene.threshold_road.choice_turn_back",
          goto: "camp_retreat",
          transitionAnimationId: "campfireRest"
        }
      ]
    },
    {
      id: "war_ossuary",
      chapterId: "chapter1",
      animationId: "candleFlame",
      artId: "skull",
      textKey: "scene.war_ossuary.body",
      choices: [
        {
          textKey: "scene.war_ossuary.choice_search",
          goto: "chapel_yard",
          transitionAnimationId: "shortWalk",
          effects: [{ type: "setFlag", flag: "saw_orc_bones" }]
        },
        {
          textKey: "scene.war_ossuary.choice_leave",
          goto: "chapel_yard",
          transitionAnimationId: "shortWalk"
        }
      ]
    },
    {
      id: "chapel_yard",
      chapterId: "chapter1",
      artId: "dungeonGate",
      textKey: "scene.chapel_yard.body",
      choices: [
        {
          textKey: "scene.chapel_yard.choice_descend",
          goto: "entry_hall",
          transitionAnimationId: "dungeonDoor",
          effects: [{ type: "setFlag", flag: "crossed_threshold" }]
        },
        {
          textKey: "scene.chapel_yard.choice_fresco",
          goto: "entry_hall",
          transitionAnimationId: "dungeonDoor",
          effects: [
            { type: "setFlag", flag: "crossed_threshold" },
            { type: "setFlag", flag: "saw_blue_fresco" }
          ]
        },
        {
          textKey: "scene.chapel_yard.choice_leave",
          goto: "camp_retreat",
          transitionAnimationId: "campfireRest"
        }
      ]
    },
    {
      id: "entry_hall",
      chapterId: "chapter1",
      animationId: "altarGlow",
      artId: "altar",
      textKey: "scene.entry_hall.body",
      choices: [
        {
          textKey: "scene.entry_hall.choice_altar",
          goto: "altar_room",
          transitionAnimationId: "dungeonDoor",
          effects: [{ type: "setFlag", flag: "saw_ossuary_altar" }]
        },
        {
          textKey: "scene.entry_hall.choice_gallery",
          goto: "bone_gallery",
          transitionAnimationId: "dungeonDoor"
        },
        {
          textKey: "scene.entry_hall.choice_torch",
          goto: "torch_corridor",
          transitionAnimationId: "dungeonDoor",
          effects: [{ type: "addItem", item: "torch" }]
        }
      ]
    },
    {
      id: "altar_room",
      chapterId: "chapter1",
      animationId: "altarGlow",
      artId: "altar",
      textKey: "scene.altar_room.body",
      choices: [
        {
          textKey: "scene.altar_room.choice_read_margin",
          goto: "scroll_vision",
          transitionAnimationId: "dungeonDoor",
          effects: [{ type: "setFlag", flag: "read_bone_margin" }]
        },
        {
          textKey: "scene.altar_room.choice_leave",
          goto: "torch_corridor",
          transitionAnimationId: "dungeonDoor"
        }
      ]
    },
    {
      id: "scroll_vision",
      chapterId: "chapter1",
      animationId: "altarGlow",
      artId: "altar",
      textKey: "scene.scroll_vision.body",
      choices: [
        {
          textKey: "scene.scroll_vision.choice_forward",
          goto: "watcher_door",
          transitionAnimationId: "dungeonDoor",
          effects: [{ type: "setFlag", flag: "heard_throne_voice" }]
        },
        {
          textKey: "scene.scroll_vision.choice_retreat",
          goto: "torch_corridor",
          transitionAnimationId: "dungeonDoor"
        }
      ]
    },
    {
      id: "bone_gallery",
      chapterId: "chapter1",
      animationId: "torchFlicker",
      artId: "corridor",
      textKey: "scene.bone_gallery.body",
      choices: [
        {
          textKey: "scene.bone_gallery.choice_chain",
          goto: "grave_answer",
          transitionAnimationId: "shortWalk",
          effects: [{ type: "setFlag", flag: "pitied_dead" }]
        },
        {
          textKey: "scene.bone_gallery.choice_leave",
          goto: "torch_corridor",
          transitionAnimationId: "dungeonDoor"
        }
      ]
    },
    {
      id: "grave_answer",
      chapterId: "chapter1",
      animationId: "skullWhisper",
      artId: "skull",
      textKey: "scene.grave_answer.body",
      choices: [
        {
          textKey: "scene.grave_answer.choice_question",
          goto: "sealed_gate",
          effects: [{ type: "setFlag", flag: "spoke_with_dead" }]
        },
        {
          textKey: "scene.grave_answer.choice_mercy",
          goto: "torch_corridor",
          conditions: [{ type: "hasItem", item: "mentor_token" }],
          effects: [{ type: "setFlag", flag: "offered_mercy" }]
        },
        {
          textKey: "scene.grave_answer.choice_leave",
          goto: "torch_corridor"
        }
      ]
    },
    {
      id: "torch_corridor",
      chapterId: "chapter1",
      animationId: "torchFlicker",
      artId: "corridor",
      textKey: "scene.torch_corridor.body",
      choices: [
        {
          textKey: "scene.torch_corridor.choice_skeletons",
          goto: "skeleton_clash"
        },
        {
          textKey: "scene.torch_corridor.choice_symbol",
          goto: "sealed_gate",
          conditions: [{ type: "hasItem", item: "black_grimoire" }]
        },
        {
          textKey: "scene.torch_corridor.choice_back",
          goto: "entry_hall",
          transitionAnimationId: "dungeonDoor"
        }
      ]
    },
    {
      id: "skeleton_clash",
      chapterId: "chapter1",
      animationId: "skullWhisper",
      artId: "corridor",
      textKey: "scene.skeleton_clash.body",
      choices: [
        {
          textKey: "scene.skeleton_clash.choice_attack",
          goto: "ending_skeletons"
        },
        {
          textKey: "scene.skeleton_clash.choice_command",
          goto: "sealed_gate",
          effects: [{ type: "setFlag", flag: "tasted_command" }]
        },
        {
          textKey: "scene.skeleton_clash.choice_defy",
          goto: "watcher_door",
          conditions: [{ type: "hasItem", item: "mentor_token" }],
          effects: [{ type: "setFlag", flag: "defied_the_dead" }]
        }
      ]
    },
    {
      id: "sealed_gate",
      chapterId: "chapter1",
      animationId: "torchFlicker",
      artId: "corridor",
      textKey: "scene.sealed_gate.body",
      choices: [
        {
          textKey: "scene.sealed_gate.choice_open",
          goto: "watcher_door",
          transitionAnimationId: "dungeonDoor",
          effects: [{ type: "setFlag", flag: "opened_inner_door" }]
        },
        {
          textKey: "scene.sealed_gate.choice_kneel",
          goto: "ending_pact"
        },
        {
          textKey: "scene.sealed_gate.choice_flee",
          goto: "ending_broken"
        }
      ]
    },
    {
      id: "watcher_door",
      chapterId: "chapter1",
      animationId: "altarGlow",
      artId: "altar",
      textKey: "scene.watcher_door.body",
      choices: [
        {
          textKey: "scene.watcher_door.choice_seek_power",
          goto: "ending_pact"
        },
        {
          textKey: "scene.watcher_door.choice_destroy",
          goto: "ending_broken"
        },
        {
          textKey: "scene.watcher_door.choice_seek_allies",
          goto: "ending_allies",
          conditions: [{ type: "hasFlag", flag: "remembered_edrin" }]
        }
      ]
    },
    {
      id: "ending_skeletons",
      chapterId: "chapter1",
      animationId: "skullWhisper",
      artId: "skull",
      textKey: "scene.ending_skeletons.body",
      ending: true,
      choices: [
        {
          textKey: "ui.play_again",
          goto: "intro_home",
          effects: [{ type: "resetState" }]
        }
      ]
    },
    {
      id: "ending_pact",
      chapterId: "chapter1",
      animationId: "grimoirePulse",
      artId: "grimoire",
      textKey: "scene.ending_pact.body",
      ending: true,
      choices: [
        {
          textKey: "ui.play_again",
          goto: "intro_home",
          effects: [{ type: "resetState" }]
        }
      ]
    },
    {
      id: "ending_broken",
      chapterId: "chapter1",
      animationId: "campfireRest",
      textKey: "scene.ending_broken.body",
      ending: true,
      choices: [
        {
          textKey: "ui.play_again",
          goto: "intro_home",
          effects: [{ type: "resetState" }]
        }
      ]
    },
    {
      id: "ending_allies",
      chapterId: "chapter1",
      animationId: "candleFlame",
      artId: "altar",
      textKey: "scene.ending_allies.body",
      ending: true,
      choices: [
        {
          textKey: "ui.play_again",
          goto: "intro_home",
          effects: [{ type: "resetState" }]
        }
      ]
    },
    {
      id: "ending_cowardice",
      chapterId: "chapter1",
      animationId: "longRide",
      textKey: "scene.ending_cowardice.body",
      ending: true,
      choices: [
        {
          textKey: "ui.play_again",
          goto: "intro_home",
          effects: [{ type: "resetState" }]
        }
      ]
    }
  ]
};
