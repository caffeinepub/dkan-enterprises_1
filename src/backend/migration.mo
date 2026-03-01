import List "mo:core/List";
import Map "mo:core/Map";

module {
  type OldActor = {
    districtMappings : Map.Map<Text, [Text]>;
  };

  type NewActor = {
    districtMappings : Map.Map<Text, List.List<Text>>;
  };

  public func run(old : OldActor) : NewActor {
    let newMap = old.districtMappings.map<Text, [Text], List.List<Text>>(
      func(_state, districts) {
        List.fromArray<Text>(districts);
      }
    );
    { districtMappings = newMap };
  };
};
